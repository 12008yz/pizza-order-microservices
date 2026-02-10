export default function PageLoadingSkeleton() {
  return (
    <div
      className="fixed inset-0 z-[9999] flex flex-col items-center overflow-hidden"
      style={{
        height: '100dvh',
        boxSizing: 'border-box',
        paddingTop: 'var(--sat, 0px)',
        paddingBottom: '25px',
        background: '#F5F5F5',
      }}
    >
      {/* 400px ширина как в Frame1 */}
      <div
        className="relative bg-[#F5F5F5]"
        style={{
          width: 400,
          minWidth: 400,
          maxWidth: 400,
          minHeight: '100%',
          boxSizing: 'border-box',
        }}
      >


        {/* Top white card - Rectangle 67: 360x120, top: 75+40+15=130 */}
        <div
          style={{
            position: 'absolute',
            width: 360,
            height: 120,
            left: 20,
            top: 50,
            background: '#FFFFFF',
            borderRadius: 20,
          }}
        >
          <div
            style={{
              position: 'absolute',
              left: 14,
              right: 58,
              top: 15,
              height: 20,
              background: '#F5F5F5',
              borderRadius: 10,
            }}
          />
          <div
            style={{
              position: 'absolute',
              left: 14,
              right: 14,
              top: 40,
              height: 65,
              background: '#F5F5F5',
              borderRadius: 10,
            }}
          />
          <div
            style={{
              position: 'absolute',
              width: 16,
              height: 16,
              right: 15,
              top: 15,
              background: '#F5F5F5',
              borderRadius: 10,
            }}
          />
        </div>

        {/* Блок 2 - Rectangle 30 */}
        <div
          style={{
            position: 'absolute',
            left: 20,
            right: 20,
            top: 233,
            bottom: 98,
            background: '#FFFFFF',
            borderRadius: 20,
          }}
        >
          {/* Rectangle 38 */}
          <div
            style={{
              position: 'absolute',
              left: 15,
              right: 15,
              top: 12,
              width: 330,
              height: 90,
              background: '#F5F5F5',
              borderRadius: 10,
            }}
          />
          {/* Rectangle 39 */}
          <div
            style={{
              position: 'absolute',
              left: 15,
              width: 240,
              top: 95,
              height: 20,
              background: '#F5F5F5',
              borderRadius: 100,
            }}
          />
         
          {/* Rectangle 37 */}
          <div
            style={{
              position: 'absolute',
              left: 15,
              right: 15,
              top: 123,
              width: 330,
              height: 50,
              background: '#F5F5F5',
              borderRadius: 10,
            }}
          >
            <div
              style={{
                position: 'absolute',
                width: 16,
                height: 16,
                right: 17,
                top: '50%',
                transform: 'translateY(-50%)',
                background: '#FFFFFF',
                borderRadius: 10,
              }}
            />
          </div>
          {/* 4-й контейнер — как 3-й */}
          <div
            style={{
              position: 'absolute',
              left: 15,
              right: 15,
              top: 183,
              width: 330,
              height: 50,
              background: '#F5F5F5',
              borderRadius: 10,
            }}
          >
            <div
              style={{
                position: 'absolute',
                width: 16,
                height: 16,
                right: 17,
                top: '50%',
                transform: 'translateY(-50%)',
                background: '#FFFFFF',
                borderRadius: 10,
              }}
            />
          </div>
          {/* 5-й контейнер */}
          <div
            style={{
              position: 'absolute',
              left: 15,
              right: 15,
              top: 243,
              width: 330,
              height: 50,
              background: '#F5F5F5',
              borderRadius: 10,
            }}
          >
            <div
              style={{
                position: 'absolute',
                width: 16,
                height: 16,
                right: 17,
                top: '50%',
                transform: 'translateY(-50%)',
                background: '#FFFFFF',
                borderRadius: 10,
              }}
            />
          </div>
          {/* 6-й контейнер */}
          <div
            style={{
              position: 'absolute',
              left: 15,
              right: 15,
              top: 303,
              width: 330,
              height: 50,
              background: '#F5F5F5',
              borderRadius: 10,
            }}
          >
            <div
              style={{
                position: 'absolute',
                width: 16,
                height: 16,
                right: 17,
                top: '50%',
                transform: 'translateY(-50%)',
                background: '#FFFFFF',
                borderRadius: 10,
              }}
            />
          </div>
          {/* 7-й контейнер */}
          <div
            style={{
              position: 'absolute',
              left: 15,
              right: 15,
              top: 363,
              width: 330,
              height: 50,
              background: '#F5F5F5',
              borderRadius: 10,
            }}
          >
            <div
              style={{
                position: 'absolute',
                width: 16,
                height: 16,
                left: 17,
                top: '50%',
                transform: 'translateY(-50%)',
                background: '#FFFFFF',
                borderRadius: 10,
              }}
            />
          </div>
          {/* 8-й контейнер — отступ 20px от 7-го, без точки */}
          <div
            style={{
              position: 'absolute',
              left: 15,
              right: 15,
              top: 433,
              width: 330,
              height: 50,
              background: '#F5F5F5',
              borderRadius: 10,
            }}
          />
        </div>
      </div>
    </div>
  );
}
